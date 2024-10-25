from django.contrib import admin
from .models import CarMake, CarModel


# Register your models here.

# CarModelInline class
class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1 
# CarModelAdmin class
class CarModelAdmin(admin.ModelAdmin):
    fields = ['car_make', 'name', 'type', 'year']  
    list_display = ('name', 'car_make', 'type', 'year') 
    list_filter = ['type', 'year']  
    search_fields = ['name', 'car_make__name']  


# CarMakeAdmin class with CarModelInline
class CarMakeAdmin(admin.ModelAdmin):
    inlines = [CarModelInline]  
    list_display = ('name', 'description')  
    search_fields = ['name'] 

# Register models here
admin.site.register(CarMake)
admin.site.register(CarModel)