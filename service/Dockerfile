FROM python:3.11.11-alpine3.19
COPY . /server
WORKDIR /server
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 8080
ENTRYPOINT ["uvicorn", "app:application", "--host", "0.0.0.0", "--port", "8080"]