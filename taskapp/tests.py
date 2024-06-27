from django.test import TestCase
import unittest
from .models import User, Task
from django.utils import timezone
# Create your tests here.

class TestTaskModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345678', email='test@tasky.com')

    def test_task_creation(self):
        due_date = timezone.now() + timezone.timedelta(days=3)
        task = Task.objects.create(
            title='Test Task',
            description='This is a test task',
            status='IP',
            priority='ME',
            due_date=due_date,
            category='Test Category',
            assigned_to=self.user
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertEqual(task.description, 'This is a test task')
        self.assertEqual(task.status, 'IP')
        self.assertEqual(task.priority, 'ME')
        self.assertEqual(task.due_date, due_date)
        self.assertEqual(task.category, 'Test Category')
        self.assertEqual(task.assigned_to, self.user)

    def test_task_str_representation(self):
        due_date = timezone.now() + timezone.timedelta(days=3)
        task = Task.objects.create(
            title='Test Task',
            description='This is a test task',
            status='IP',
            priority='ME',
            due_date=due_date,
            category='Test Category',
            assigned_to=self.user
        )
        self.assertEqual(str(task), 'Test Task with ME priority')

    def test_unique_together_constraint(self):
        due_date = timezone.now() + timezone.timedelta(days=3)
        Task.objects.create(
            title='Test Task',
            description='This is a test task',
            status='IP',
            priority='ME',
            due_date= due_date,
            category='Test Category',
            assigned_to=self.user
        )
        with self.assertRaises(Exception):
            due_date = timezone.now() + timezone.timedelta(days=3)
            Task.objects.create(
                title='Test Task',
                description='This is another test task',
                status='IP',
                priority='ME',
                due_date=due_date,
                category='Test Category',
                assigned_to=self.user
            )

if __name__ == '__main__':
    unittest.main()
