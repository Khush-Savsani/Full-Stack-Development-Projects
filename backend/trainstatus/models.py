from django.db import models
from datetime import timedelta

# Create your models here.

class TrainStatus(models.Model):
    Train_id = models.AutoField(primary_key=True)

    TrainNo = models.CharField(max_length=20, unique=True)

    TrainName = models.CharField(max_length=100)

    Source = models.CharField(max_length=100)
    
    SourceCode = models.CharField(max_length=10)           # e.g., ADI

    Destination = models.CharField(max_length=100)

    DestinationCode = models.CharField(max_length=10)      # e.g., JND

    Classes = models.CharField(max_length=200)  # e.g., "EA,1A,2A,SL"

    TicketPrice = models.CharField(max_length=300)  # e.g., "123,234,900,250" (order matches Classes)

    Availability = models.CharField(max_length=300)        # e.g., "Available,Available,Available"

    DepartureTime = models.TimeField()

    ArrivalTime = models.TimeField()

    DurationTime = models.DurationField(null=True, blank=True)     # e.g., 24:57:00
    
    
    DurationDays = models.CharField(max_length=50, null=True, blank=True)  # e.g., "1 Day", "2 Days"
    DistanceKM = models.FloatField(null=True, blank=True)          # e.g., 748.92
    RunningStatus = models.CharField(max_length=50, default="On Time")  # e.g., "Running Late", "Cancelled"

    # This method returns a string representation of the train object, showing train number and name.
    def __str__(self):
        return f"{self.TrainNo} - {self.TrainName}"