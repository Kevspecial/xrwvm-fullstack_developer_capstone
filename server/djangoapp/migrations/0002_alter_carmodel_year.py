from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


def validate_year_current(value):
    from django.utils.timezone import now
    current_year = now().year
    if value < 2015 or value > current_year:
        raise ValueError(f"Year must be between 2015 and {current_year}.")


class Migration(migrations.Migration):
    dependencies = [
        ('djangoapp', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='carmodel',
            name='year',
            field=models.IntegerField(default=2025, validators=[django.core.validators.MinValueValidator(2015)]),
        ),
    ]
