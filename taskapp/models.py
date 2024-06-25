from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    pass

class Task(models.Model):
    STATUS_CHOICES = [
        ('IP', 'In Progress'),
        ('CO', 'Completed'),
        ('OV', 'Overdue'),
    ]

    PRIORITY_CHOICES = [
        ('LO', 'Low'),
        ('ME', 'Medium'),
        ('HI', 'High')
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default='IP')
    priority = models.CharField(max_length=2, choices=PRIORITY_CHOICES)
    due_date = models.DateTimeField()
    category = models.CharField(max_length=255)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} with {self.priority} priority"
    
    class Meta:
        unique_together = ["title", "assigned_to"]