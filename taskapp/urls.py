from django.urls import path
from .views import *

urlpatterns = [
    path("tasks/", TaskListView.as_view(), name="task-list"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("tasks/<int:pk>/update/", UpdateTaskView.as_view(), name="task-update"), 
    path("tasks/<int:pk>/delete/", DeleteTaskView.as_view(), name="task-delete"),
    path('tasks/in_progress/', InProgressTaskListView.as_view(), name='inprogress-tasks'),
    path('tasks/completed/', CompletedTaskListView.as_view(), name='completed-tasks'),
    path('tasks/overdue/', OverdueTaskListView.as_view(), name='overdue-tasks'),
    path('search/', TaskSearchView.as_view(), name='task_search'),
]
