from django.urls import path
from .views import TaskListView, DeleteTaskView, UpdateTaskView

urlpatterns = [
    path("tasks/", TaskListView.as_view(), name="task-list"),
    path("tasks/update/<int:pk>/", UpdateTaskView.as_view(), name="task-update"), 
    path("tasks/delete/<int:pk>/", DeleteTaskView.as_view(), name="task-delete")
]
