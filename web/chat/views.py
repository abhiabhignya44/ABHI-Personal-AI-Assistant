# from django.shortcuts import render

# def home(request):
#     return render(request,"chat/index.html")

import sys
from pathlib import Path

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST

# Locate the project root containing main.py.
PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import main


def home(request):
    return render(request, "chat/index.html")


@require_POST
def chat_response(request):  #recevies msg from webpage
    message = request.POST.get("message", "").strip()

    if not message:
        return JsonResponse(
            {"reply": "Please type a message."},
            status=400,
        )

    try:
        reply = main.respond(message)
        return JsonResponse({"reply": str(reply)})

    except Exception:
        return JsonResponse(
            {"reply": "Sorry, something went wrong. Please try again."},
            status=500,
        )