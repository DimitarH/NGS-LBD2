FROM ubuntu:20.04

RUN apt update -y && \
    apt install -y python3-pip wget unzip

# We copy just the requirements.txt first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

ENV PYTHONUNBUFFERED 1

RUN pip install -r requirements.txt
RUN gdown 1JonTc1TP3-Tm7WhUUSGl8n9kKYzmH9_m
RUN unzip pairre-small.zip
RUN rm pairre-small.zip

COPY . /app

CMD ["python3", "-u", "app.py" ]