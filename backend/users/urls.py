from django.urls import path
from . import views

urlpatterns = [
    path('auth/', views.auth, name='auth'),
    path('save-passengers/', views.save_passengers, name='save_passengers'),
    path('check-seats/', views.check_seat_availability, name='check_seat_availability'),
    path('booking-by-pnr/', views.booking_by_pnr, name='booking_by_pnr'),
    path('cancel-booking/', views.cancel_booking, name='cancel_booking'),
]
