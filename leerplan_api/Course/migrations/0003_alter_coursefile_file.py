# Generated by Django 5.0.5 on 2024-06-04 00:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Course', '0002_alter_courseweeklyreading_chapter_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coursefile',
            name='file',
            field=models.FileField(blank=True, upload_to=''),
        ),
    ]
