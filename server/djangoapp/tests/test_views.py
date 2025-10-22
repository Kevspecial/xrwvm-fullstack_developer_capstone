from django.test import TestCase, Client
from django.urls import reverse
from djangoapp.models import CarMake, CarModel


class TestCarsEndpoint(TestCase):
    def setUp(self):
        make = CarMake.objects.create(name="TestMake", description="Desc")
        CarModel.objects.create(name="ModelA", car_make=make, type='SUV', year=2023)

    def test_get_cars_returns_models(self):
        c = Client()
        url = reverse('djangoapp:get_cars')
        resp = c.get(url)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('CarModels', data)
        self.assertGreaterEqual(len(data['CarModels']), 1)
        self.assertEqual(data['CarModels'][0]['CarMake'], 'TestMake')
