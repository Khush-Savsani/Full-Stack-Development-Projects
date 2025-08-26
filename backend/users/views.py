from django.shortcuts import render

# Create your views here.

import json
import random
from datetime import datetime
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User, PassengerDetails, CancelledBooking

AC_CLASSES = {"EA","1A","EV","EC","2A","FC","3A","3E","VC","CC"}

def _tax_rate_for_class(train_class: str) -> float:
    code = (train_class or '').upper()
    if code in {"SL","2S"}:
        return 0.0
    return 0.05 if code in AC_CLASSES else 0.0

@csrf_exempt
def auth(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    action   = data.get('action')
    email    = data.get('email',   '').strip()
    password = data.get('password','').strip()

    if action == 'signup':
        name = data.get('name','').strip()
        if not (name and email and password):
            return JsonResponse({'error': 'Name, email, and password are required.'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already registered.'}, status=409)

        user = User.objects.create(username=name,email=email,password=password)
        return JsonResponse({'message': 'Signup successful', 'user_id': user.user_id}, status=201) # or user_id if you want the integer PK

    elif action == 'login':
        if not (email and password):
            return JsonResponse({'error': 'Email and password are required.'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found.'}, status=404)

        if user.password != password:
            return JsonResponse({'error': 'Incorrect password.'}, status=401)

        return JsonResponse({'message': 'Login successful','user_id':   user.user_id}, status=200)

    else:
        return JsonResponse({'error': 'Invalid action.'}, status=400)


def _generate_unique_pnr():
    # Generate a random 10-digit numeric PNR and ensure uniqueness
    while True:
        pnr = ''.join(str(random.randint(0,9)) for _ in range(10))
        if not PassengerDetails.objects.filter(pnr_number=pnr).exists():
            return pnr


# Base seats per class code (same as frontend)
BASE_SEATS_BY_CLASS = {
    "EA": 56, "1A": 24, "EV": 40, "EC": 56, "2A": 52, "FC": 26,
    "3A": 72, "3E": 83, "VC": 40, "CC": 78, "SL": 80, "VS": 44, "2S": 102,
}

def _get_booked_seats(train_number, date, train_class):
    """Get list of already booked seat numbers for a train/date/class"""
    bookings = PassengerDetails.objects.filter(
        train_number=train_number,
        date_of_departure=date,
        train_class=train_class
    ).values_list('booked_seat_number', flat=True)
    return list(bookings)

def _generate_seat_number(train_class, seat_index):
    """Generate seat number based on class and index"""
    # Different seat naming conventions per class
    if train_class in ["1A", "2A", "3A"]:
        # AC classes: A1-1, A1-2, B1-1, B1-2, etc.
        coach = chr(65 + (seat_index // 8))  # A, B, C, D...
        compartment = (seat_index % 8) // 2 + 1
        berth = (seat_index % 2) + 1
        return f"{coach}{compartment}-{berth}"
    elif train_class == "SL":
        # Sleeper: S1-1, S1-2, S2-1, S2-2, etc.
        coach = (seat_index // 8) + 1
        berth = (seat_index % 8) + 1
        return f"S{coach}-{berth}"
    elif train_class in ["2S", "CC"]:
        # Seating: 1, 2, 3, 4, etc.
        return str(seat_index + 1)
    else:
        # Default format
        return f"{train_class}-{seat_index + 1}"

def _allocate_seats(train_number, date, train_class, num_passengers):
    """Allocate consecutive available seats for passengers"""
    booked_seats = _get_booked_seats(train_number, date, train_class)
    total_seats = BASE_SEATS_BY_CLASS.get(train_class, 50)
    
    # Check if enough seats available
    available_count = total_seats - len(booked_seats)
    if available_count < num_passengers:
        return None, f"Only {available_count} seats available in {train_class} class"
    
    # Generate all possible seat numbers for this class
    all_seats = [_generate_seat_number(train_class, i) for i in range(total_seats)]
    
    # Create a boolean array to track which seats are booked
    seat_taken = [False] * total_seats
    for booked_seat in booked_seats:
        try:
            seat_index = all_seats.index(booked_seat)
            seat_taken[seat_index] = True
        except ValueError:
            continue  # Skip if seat not found in all_seats
    
    # Find consecutive available seats
    allocated_seats = []
    for start_idx in range(total_seats - num_passengers + 1):
        # Check if we can allocate num_passengers consecutive seats starting from start_idx
        can_allocate = True
        for i in range(num_passengers):
            if seat_taken[start_idx + i]:
                can_allocate = False
                break
        
        if can_allocate:
            # Allocate consecutive seats
            for i in range(num_passengers):
                allocated_seats.append(all_seats[start_idx + i])
            break
    
    # If no consecutive seats found, fall back to any available seats
    if len(allocated_seats) < num_passengers:
        available_seats = [seat for seat in all_seats if seat not in booked_seats]
        allocated_seats = available_seats[:num_passengers]
    
    return allocated_seats, None


@csrf_exempt
def check_seat_availability(request):
    """Check seat availability and get allocated seats for booking"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    train_number = data.get('train_number')
    date = data.get('date')  # YYYY-MM-DD format
    train_class = data.get('train_class')
    num_passengers = data.get('num_passengers', 1)
    
    if not all([train_number, date, train_class]):
        return JsonResponse({'error': 'train_number, date, and train_class are required'}, status=400)
    
    try:
        # Parse date
        parsed_date = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format, expected YYYY-MM-DD'}, status=400)
    
    # Allocate seats
    allocated_seats, error = _allocate_seats(train_number, parsed_date, train_class, num_passengers)
    
    if error:
        return JsonResponse({'error': error, 'available': False}, status=400)
    
    # Get current booking count
    booked_count = len(_get_booked_seats(train_number, parsed_date, train_class))
    total_seats = BASE_SEATS_BY_CLASS.get(train_class, 50)
    available_count = total_seats - booked_count
    
    return JsonResponse({
        'available': True,
        'allocated_seats': allocated_seats,
        'total_seats': total_seats,
        'booked_count': booked_count,
        'available_count': available_count
    }, status=200)


@csrf_exempt
def save_passengers(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Expected payload structure (example):
    # {
    #   "booking": { "Source": "...", "Destination": "...", "Train_Name": "...", "Train_Number": "...",
    #                "Departure_Time": "10:30", "Arrival_Time": "18:45", "Duration": "08:15", "Distance": "500 km",
    #                "Class": "3A", "Quota": "GN", "Date_of_Departure": "2025-08-21", "Date_of_Arrival": "2025-08-22" },
    #   "passengers": [ {"Name": "A", "Age": 28, "Gender": "M", "Berth_Selected": "LB", "Booked_Seat_Number": "A1-23"}, ...],
    #   "contact": {"Email": "x@y.com", "Mobile_No": "9999999999", "State": "MH"},
    #   "fare_per_person": 350.00,  # base fare (without GST)
    #   "free_cancellation": false
    # }

    booking = data.get('booking') or {}
    passengers = data.get('passengers') or []
    contact = data.get('contact') or {}
    fare_per_person = data.get('fare_per_person')
    free_cancel = bool(data.get('free_cancellation', False))

    if not passengers:
        return JsonResponse({'error': 'No passengers provided.'}, status=400)
    required_booking = [
        'Source','Destination','Train_Name','Train_Number','Departure_Time','Arrival_Time','Duration','Distance','Class','Quota','Date_of_Departure'
    ]
    missing = [k for k in required_booking if not booking.get(k)]
    if missing:
        return JsonResponse({'error': f'Missing booking fields: {", ".join(missing)}'}, status=400)

    if fare_per_person is None:
        return JsonResponse({'error': 'fare_per_person is required.'}, status=400)

    email = (contact.get('Email') or contact.get('email') or '').strip()
    mobile = (contact.get('Mobile_No') or contact.get('phone') or contact.get('mobile') or '').strip()
    state = contact.get('State') or contact.get('state')

    # Shared PNR for all passengers in this booking
    pnr = _generate_unique_pnr()

    created = []
    for p in passengers:
        name = p.get('Name') or p.get('name')
        age = p.get('Age') or p.get('age')
        gender = p.get('Gender') or p.get('gender')
        berth = p.get('Berth_Selected') or p.get('berth') or 'Not Selected'
        seat_no = p.get('Booked_Seat_Number') or p.get('seat') or 'NA'

        if not (name and age and gender):
            return JsonResponse({'error': 'Each passenger must have Name, Age, Gender.'}, status=400)

        # Parse dates (YYYY-MM-DD expected)
        try:
            dep_date = datetime.strptime(booking['Date_of_Departure'], '%Y-%m-%d').date()
        except ValueError:
            return JsonResponse({'error': 'Invalid Date_of_Departure format, expected YYYY-MM-DD.'}, status=400)
        arr_date = None
        if booking.get('Date_of_Arrival'):
            try:
                arr_date = datetime.strptime(booking['Date_of_Arrival'], '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({'error': 'Invalid Date_of_Arrival format, expected YYYY-MM-DD.'}, status=400)

        rate = _tax_rate_for_class(booking['Class'])
        gst_amt = round(float(fare_per_person) * rate, 2)

        obj = PassengerDetails.objects.create(
            source=booking['Source'],
            destination=booking['Destination'],
            train_name=booking['Train_Name'],
            train_number=booking['Train_Number'],
            departure_time=booking['Departure_Time'],
            arrival_time=booking['Arrival_Time'],
            duration=booking['Duration'],
            distance=booking['Distance'],
            email=email,
            mobile_no=mobile,
            state=state,
            berth_selected=berth,
            name=name,
            age=int(age),
            gender=str(gender),
            date_of_departure=dep_date,
            date_of_arrival=arr_date,
            booked_seat_number=seat_no,
            train_class=booking['Class'],
            quota=booking['Quota'],
            fare=fare_per_person,
            gst_incl=gst_amt,
            pnr_number=pnr,
            free_cancellation=free_cancel,
        )
        created.append({
            'id': obj.id,
            'pnr': obj.pnr_number,
            'name': obj.name,
        })

    return JsonResponse({'message': 'Passengers saved', 'pnr': pnr, 'count': len(created), 'items': created}, status=201)


@csrf_exempt
def booking_by_pnr(request):
    """Lookup booking details by PNR. Optional filters: train_number, date (YYYY-MM-DD), class.
    Returns all active passengers for that PNR (i.e., not cancelled)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    pnr = (data.get('pnr') or data.get('PNR') or '').strip()
    if not pnr:
        return JsonResponse({'error': 'pnr is required'}, status=400)

    qs = PassengerDetails.objects.filter(pnr_number=pnr)
    train_number = data.get('train_number') or data.get('Train_Number')
    train_class = data.get('class') or data.get('Class')
    date_str = data.get('date') or data.get('Date_of_Departure')

    if train_number:
        qs = qs.filter(train_number=train_number)
    if train_class:
        qs = qs.filter(train_class=train_class)
    if date_str:
        try:
            parsed_date = datetime.strptime(str(date_str), '%Y-%m-%d').date()
            qs = qs.filter(date_of_departure=parsed_date)
        except ValueError:
            return JsonResponse({'error': 'Invalid date format, expected YYYY-MM-DD'}, status=400)

    passengers = list(qs.values(
        'id','name','age','gender','booked_seat_number','fare','gst_incl','free_cancellation',
        'source','destination','train_name','train_number','departure_time','arrival_time',
        'duration','distance','train_class','quota','date_of_departure','date_of_arrival','created_at','email','mobile_no','state','pnr_number'
    ))

    if not passengers:
        return JsonResponse({'error': 'No active passengers found for this PNR with given filters.'}, status=404)

    # Summary by booking (shared fields from first record)
    head = passengers[0]
    summary = {
        'pnr': head['pnr_number'],
        'source': head['source'],
        'destination': head['destination'],
        'train_name': head['train_name'],
        'train_number': head['train_number'],
        'class': head['train_class'],
        'date_of_departure': head['date_of_departure'].
            isoformat() if hasattr(head['date_of_departure'], 'isoformat') else str(head['date_of_departure']),
        'count': len(passengers),
    }

    # Convert created_at to local IST string for each passenger
    for p in passengers:
        ca = p.get('created_at')
        if ca:
            try:
                p['created_at'] = timezone.localtime(ca).isoformat()
            except Exception:
                p['created_at'] = str(ca)

    return JsonResponse({'summary': summary, 'passengers': passengers}, status=200)


@csrf_exempt
def cancel_booking(request):
    """Cancel one or more passengers from a booking by PNR.
    Expected JSON:
    {
      "pnr": "1234567890",
      "train_number": "12957",         # optional filter
      "class": "3A",                   # optional filter
      "date": "2025-08-21",            # optional filter (YYYY-MM-DD)
      "passenger_ids": [1,2]            # OR provide seat_numbers: ["A1-1", ...]
    }
    Rules:
      - If free_cancellation for a passenger is true => refund = fare
      - Else refund = round(0.7 * fare, 2)
      - Deletes PassengerDetails rows and creates CancelledBooking audit rows
      - Seat availability increases automatically since check uses DB counts
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    pnr = (data.get('pnr') or data.get('PNR') or '').strip()
    if not pnr:
        return JsonResponse({'error': 'pnr is required'}, status=400)

    train_number = data.get('train_number') or data.get('Train_Number')
    train_class = data.get('class') or data.get('Class')
    date_str = data.get('date') or data.get('Date_of_Departure')
    passenger_ids = data.get('passenger_ids') or []
    seat_numbers = data.get('seat_numbers') or []

    qs = PassengerDetails.objects.filter(pnr_number=pnr)
    if train_number:
        qs = qs.filter(train_number=train_number)
    if train_class:
        qs = qs.filter(train_class=train_class)
    if date_str:
        try:
            parsed_date = datetime.strptime(str(date_str), '%Y-%m-%d').date()
            qs = qs.filter(date_of_departure=parsed_date)
        except ValueError:
            return JsonResponse({'error': 'Invalid date format, expected YYYY-MM-DD'}, status=400)

    if passenger_ids:
        qs = qs.filter(id__in=passenger_ids)
    elif seat_numbers:
        qs = qs.filter(booked_seat_number__in=seat_numbers)

    items = list(qs)
    if not items:
        return JsonResponse({'error': 'No matching passengers to cancel.'}, status=404)

    cancelled = []
    total_refund = 0.0
    for obj in items:
        refund = float(obj.fare) if obj.free_cancellation else round(float(obj.fare) * 0.70, 2)

        CancelledBooking.objects.create(
            source=obj.source,
            destination=obj.destination,
            train_name=obj.train_name,
            train_number=obj.train_number,
            departure_time=obj.departure_time,
            arrival_time=obj.arrival_time,
            duration=obj.duration,
            distance=obj.distance,
            email=obj.email,
            mobile_no=obj.mobile_no,
            state=obj.state,
            berth_selected=obj.berth_selected,
            name=obj.name,
            age=obj.age,
            gender=obj.gender,
            date_of_departure=obj.date_of_departure,
            date_of_arrival=obj.date_of_arrival,
            booked_seat_number=obj.booked_seat_number,
            train_class=obj.train_class,
            quota=obj.quota,
            fare=obj.fare,
            pnr_number=obj.pnr_number,
            free_cancellation=obj.free_cancellation,
            refund_amount=refund,
        )

        cancelled.append({
            'id': obj.id,
            'name': obj.name,
            'seat': obj.booked_seat_number,
            'refund': refund,
        })
        total_refund += refund

        # Remove from active bookings
        obj.delete()

    return JsonResponse({
        'message': 'Cancellation successful',
        'pnr': pnr,
        'cancelled_count': len(cancelled),
        'cancelled': cancelled,
        'total_refund': round(total_refund, 2)
    }, status=200)


# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json
# from .models import User

# @csrf_exempt
# def signup(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         userid = data.get('userid')
#         email = data.get('email')
#         password = data.get('password')
#         artists = data.get('artists', [])

#         if not userid or not email or not password:
#             return JsonResponse({'error': 'All fields are required'}, status=400)

#         if len(password) < 8:
#             return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)

#         if User.objects.filter(userid=userid).exists():
#             return JsonResponse({'error': 'User ID already exists'}, status=400)

#         if User.objects.filter(email=email).exists():
#             return JsonResponse({'error': 'Email already exists'}, status=400)

#         # Save user
#         user = User.objects.create(userid=userid, email=email, password=password,artists=artists)

#         # Optional: Save artists in a separate model/table if needed
#         print("🎵 Selected artists for", userid, ":", artists)

#         return JsonResponse({'message': 'User registered successfully'}, status=201)

#     return JsonResponse({'error': 'Only POST method allowed'}, status=405)


# # views.py
# @csrf_exempt
# def login(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         identifier = data.get('userid')  # can be userid or email
#         password = data.get('password')

#         if not identifier or not password:
#             return JsonResponse({'error': 'User ID/Email and password are required'}, status=400)

#         # Check if identifier looks like an email
#         if '@' in identifier:
#             try:
#                 user = User.objects.get(email=identifier)
#             except User.DoesNotExist:
#                 return JsonResponse({'error': 'Email not found'}, status=404)
#         else:
#             try:
#                 user = User.objects.get(userid=identifier)
#             except User.DoesNotExist:
#                 return JsonResponse({'error': 'User ID not found'}, status=404)

#         if user.password == password:
          
#             return JsonResponse({
#                 'message': 'Login successful',
#                 'userid': user.userid  # ✅ Now sending userid
#             }, status=200)
#         else:
#             return JsonResponse({'error': 'Incorrect password'}, status=401)

#     return JsonResponse({'error': 'Only POST method allowed'}, status=405)
