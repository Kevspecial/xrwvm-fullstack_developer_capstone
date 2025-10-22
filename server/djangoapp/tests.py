from django.test import TestCase, Client
from django.urls import reverse
from djangoapp.models import CarMake, CarModel


class TestSmoke(TestCase):
    def test_smoke(self):
        self.assertTrue(True)

    def test_get_cars_endpoint(self):
        make = CarMake.objects.create(name="SmokeMake", description="Desc")
        CarModel.objects.create(name="SmokeModel", car_make=make, type='SUV', year=2023)
        c = Client()
        resp = c.get(reverse('djangoapp:get_cars'))
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('CarModels', data)
        self.assertTrue(any(cm['CarMake'] == 'SmokeMake' for cm in data['CarModels']))
