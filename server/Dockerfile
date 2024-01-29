FROM nvcr.io/nvidia/pytorch:23.12-py3
COPY . /server
WORKDIR /server
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 8080
ENTRYPOINT ["./start.sh"]