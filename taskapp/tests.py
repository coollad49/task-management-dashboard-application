from django.test import TestCase, Client
import unittest
from .models import User, Task
from django.utils import timezone
from django.urls import reverse
from .serializers import TaskSerializer
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

class TestLoginView(TestCase):
    def setUp(self):
        self.client = Client()
        self.username = "testuser"
        self.password = "testpassword"
        self.user = User.objects.create_user(self.username, "test@tasky.com", self.password)

    def test_login_view_valid_credentials(self):
        response = self.client.post(reverse("login"), {"username": self.username, "password": self.password})
        self.assertEqual(response.status_code, 302)

    def test_login_view_invalid_credentials(self):
        response = self.client.post(reverse("login"), {"username": self.username, "password": "wrongpassword"})
        self.assertEqual(response.status_code, 200)

class TestRegisterView(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_view_valid_data(self):
        response = self.client.post(reverse("register"), {"username": "testuser", "email": "test@tasky.com", "password": "testpassword", "confirmation": "testpassword"})
        self.assertEqual(response.status_code, 302)

    def test_register_view_invalid_data(self):
        response = self.client.post(reverse("register"), {"username": "testuser", "email": "test@tasky.com", "password": "testpassword", "confirmation": "wrongpassword"})
        self.assertEqual(response.status_code, 200)
class TestTaskViews(TestCase):
    def setUp(self):
        self.client = Client()
        self.username = "testuser"
        self.password = "testpassword"
        self.user = User.objects.create_user(self.username, "test@tasky.com", self.password)
        self.client.login(username=self.username, password=self.password)
        self.due_date = timezone.now() + timezone.timedelta(days=3)

    def test_task_list_view(self):
        response = self.client.get(reverse("task-list"))
        self.assertEqual(response.status_code, 200)

    def test_task_detail_view(self):
        task = Task.objects.create(title="Test Task", assigned_to=self.user, description="sbibiiwbbb", status="IP", priority="HI", due_date=self.due_date)
        response = self.client.get(reverse("task-detail", args=[task.id]))
        self.assertEqual(response.status_code, 200)

    def test_task_update_view(self):
        task = Task.objects.create(title="Test Task", assigned_to=self.user, description="sbibiiwbbb", status="IP", priority="HI", due_date=self.due_date)
        response = self.client.patch(reverse("task-update", args=[task.id]), {"title": "Updated Task"}, content_type="application/json",)
        self.assertEqual(response.status_code, 200)

    def test_task_delete_view(self):
        task = Task.objects.create(title="Test Task", assigned_to=self.user, description="sbibiiwbbb", status="IP", priority="HI", due_date=self.due_date)
        response = self.client.delete(reverse("task-delete", args=[task.id]))
        self.assertEqual(response.status_code, 204)

    def test_in_progress_task_list_view(self):
        Task.objects.create(title="Test Task", assigned_to=self.user, description="sbibiiwbbb", status="IP", priority="HI", due_date=self.due_date)
        response = self.client.get(reverse("inprogress-tasks"))
        self.assertEqual(response.status_code, 200)

    def test_completed_task_list_view(self):
        Task.objects.create(title="Test Task", assigned_to=self.user, description="sbibiiwbbb", status="CO", priority="HI", due_date=self.due_date)
        response = self.client.get(reverse("completed-tasks"))
        self.assertEqual(response.status_code, 200)

    def test_overdue_task_list_view(self):
        Task.objects.create(title="Test Task", assigned_to=self.user, description="sbibiiwbbb", status="OV", priority="HI", due_date=self.due_date)
        response = self.client.get(reverse("overdue-tasks"))
        self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main()
