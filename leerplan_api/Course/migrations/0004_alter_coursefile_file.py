# Generated by Django 5.0.5 on 2024-06-04 00:39

import Course.helper
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Course', '0003_alter_coursefile_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='coursefile',
            name='file',
            field=models.FileField(upload_to=Course.helper.course_file_upload_path),
        ),
    ]
