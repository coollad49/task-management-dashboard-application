from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    pass

class Task(models.Model):
    """
    Represents a task assigned to a user.

    Attributes:
        title (str): The title of the task.
        description (str): A brief description of the task.
        status (str): The status of the task, one of 'IP' (In Progress), 'CO' (Completed), or 'OV' (Overdue).
        priority (str): The priority of the task, one of 'LO' (Low), 'ME' (Medium), or 'HI' (High).
        due_date (datetime): The date and time the task is due.
        category (str): The category of the task.
        assigned_to (User): The user assigned to complete the task.

    Example:
        >>> task = Task(title="My Task", description="This is a task", status="IP", priority="ME", due_date=datetime.date(2023, 3, 15), category="Work", assigned_to=user)
        >>> print(task)
        My Task with ME priority
    """
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