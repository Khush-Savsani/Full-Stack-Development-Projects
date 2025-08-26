from django.contrib import admin

# Register your models here.
from .models import User, PassengerDetails
from django.utils import timezone
from django.utils.html import format_html

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("user_id", "username", "email")
    search_fields = ("username", "email")


@admin.register(PassengerDetails)
class PassengerDetailsAdmin(admin.ModelAdmin):
# This function returns the created_at time in IST (Indian Standard Time) for display in the admin panel.
    def created_at_ist(self, obj):
        try:
            dt = timezone.localtime(obj.created_at)
            # Show readable IST time
            return dt.strftime('%Y-%m-%d %H:%M:%S %Z')
        except Exception:
            return obj.created_at

    created_at_ist.short_description = "Created At (IST)"

    list_display = ("name", "train_number", "pnr_number", "source", "destination", "train_class", "fare", "created_at_ist")
    list_filter = ("train_class", "source", "destination", "free_cancellation")
    search_fields = ("name", "pnr_number", "train_number", "email", "mobile_no")