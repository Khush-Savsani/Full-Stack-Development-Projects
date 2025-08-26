from django.db import models
from django.utils import timezone

# Create your models here.
from django.db import models

class User(models.Model):
    # If you want a custom primary key field named `user_id`, declare it explicitly:
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email    = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    # This method returns the username as the string representation of the user object.
    def __str__(self):
        return self.username


class PassengerDetails(models.Model):
    # Core journey fields
    source = models.CharField(max_length=100, db_column="Source")
    destination = models.CharField(max_length=100, db_column="Destination")
    train_name = models.CharField(max_length=150, db_column="Train_Name")
    train_number = models.CharField(max_length=20, db_column="Train_Number")
    departure_time = models.CharField(max_length=20, db_column="Departure_Time")  # e.g., "10:30"
    arrival_time = models.CharField(max_length=20, db_column="Arrival_Time")      # e.g., "18:45"
    duration = models.CharField(max_length=50, db_column="Duration")              # e.g., "08:15"
    distance = models.CharField(max_length=50, db_column="Distance")              # keep as text to allow units

    # Contact shared across passengers in one booking
    email = models.EmailField(db_column="Email")
    mobile_no = models.CharField(max_length=20, db_column="Mobile_No")
    state = models.CharField(max_length=100, db_column="State", blank=True, null=True)

    # Per-passenger specifics
    berth_selected = models.CharField(max_length=30, db_column="Berth_Selected", default="Not Selected")
    name = models.CharField(max_length=120, db_column="Name")
    age = models.PositiveIntegerField(db_column="Age")
    gender = models.CharField(max_length=20, db_column="Gender")
    date_of_departure = models.DateField(db_column="Date_of_Departure")
    date_of_arrival = models.DateField(db_column="Date_of_Arrival", blank=True, null=True)
    booked_seat_number = models.CharField(max_length=20, db_column="Booked_Seat_Number")
    train_class = models.CharField(max_length=10, db_column="Class")
    quota = models.CharField(max_length=50, db_column="Quota")

    # Financials
    fare = models.DecimalField(max_digits=10, decimal_places=2, db_column="Fare")  # per-passenger base fare (without GST)
    gst_incl = models.DecimalField(max_digits=10, decimal_places=2, db_column="GST_Incl", default=0)
    pnr_number = models.CharField(max_length=10, db_column="PNR_Number")
    free_cancellation = models.BooleanField(default=False, db_column="Free_Cancellation")

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_column="Created_At")

    class Meta:
        db_table = "PassengerDetails"
        indexes = [
            models.Index(fields=["pnr_number"], name="idx_pnr_number"),
        ]

    # This method returns a string representation of the passenger details object, including name, train number, and PNR.
    def __str__(self):
        return f"{self.name} - {self.train_number} - PNR {self.pnr_number}"


class CancelledBooking(models.Model):
    # Mirror most fields from PassengerDetails for audit
    source = models.CharField(max_length=100, db_column="Source")
    destination = models.CharField(max_length=100, db_column="Destination")
    train_name = models.CharField(max_length=150, db_column="Train_Name")
    train_number = models.CharField(max_length=20, db_column="Train_Number")
    departure_time = models.CharField(max_length=20, db_column="Departure_Time")
    arrival_time = models.CharField(max_length=20, db_column="Arrival_Time", blank=True, null=True)
    duration = models.CharField(max_length=50, db_column="Duration", blank=True, null=True)
    distance = models.CharField(max_length=50, db_column="Distance", blank=True, null=True)

    email = models.EmailField(db_column="Email")
    mobile_no = models.CharField(max_length=20, db_column="Mobile_No")
    state = models.CharField(max_length=100, db_column="State", blank=True, null=True)

    berth_selected = models.CharField(max_length=30, db_column="Berth_Selected", default="Not Selected")
    name = models.CharField(max_length=120, db_column="Name")
    age = models.PositiveIntegerField(db_column="Age")
    gender = models.CharField(max_length=20, db_column="Gender")
    date_of_departure = models.DateField(db_column="Date_of_Departure")
    date_of_arrival = models.DateField(db_column="Date_of_Arrival", blank=True, null=True)
    booked_seat_number = models.CharField(max_length=20, db_column="Booked_Seat_Number")
    train_class = models.CharField(max_length=10, db_column="Class")
    quota = models.CharField(max_length=50, db_column="Quota")

    fare = models.DecimalField(max_digits=10, decimal_places=2, db_column="Fare")
    pnr_number = models.CharField(max_length=10, db_column="PNR_Number")
    free_cancellation = models.BooleanField(default=False, db_column="Free_Cancellation")

    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, db_column="Refund_Amount")
    cancelled_at = models.DateTimeField(auto_now_add=True, db_column="Cancelled_At")

    class Meta:
        db_table = "CancelledBooking"
        indexes = [
            models.Index(fields=["pnr_number"], name="idx_cancel_pnr"),
        ]

    def __str__(self):
    # This method returns a string representation for cancelled bookings, including name, train number, and PNR.
        return f"Cancelled {self.name} - {self.train_number} - PNR {self.pnr_number}"