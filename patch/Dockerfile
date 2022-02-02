FROM python:3.8
ENV PYTHONUNBUFFERED 1
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD requirements.txt /usr/src/app/
RUN pip install -r requirements.txt
ADD . /usr/src/app/
CMD ["gunicorn", "proxy:app", "-b", "0.0.0.0:5000", "--config", "guniconf.py"]