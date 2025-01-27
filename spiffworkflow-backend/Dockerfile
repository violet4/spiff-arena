# Base image to share ENV vars that activate VENV.
FROM ghcr.io/sartography/python:3.11 AS base

ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app

# base plus packages needed for deployment. Could just install these in final, but then we can't cache as much.
# vim is just for debugging
FROM base AS deployment

RUN apt-get update \
 && apt-get clean -y \
 && apt-get install -y -q curl git-core gunicorn3 default-mysql-client vim \
 && rm -rf /var/lib/apt/lists/*

# Setup image for installing Python dependencies.
FROM base AS setup

# poetry 1.4 seems to cause an issue where it errors with
#   This error originates from the build backend, and is likely not a
#   problem with poetry but with lazy-object-proxy (1.7.1) not supporting PEP 517 builds.
#   You can verify this by running 'pip wheel --use-pep517 "lazy-object-proxy (==1.7.1) ; python_version >= "3.6""'.
# Pinnning to 1.3.2 to attempt to avoid it.
RUN pip install poetry==1.3.2
RUN useradd _gunicorn --no-create-home --user-group

# default-libmysqlclient-dev for mysqlclient lib
RUN apt-get update \
 && apt-get install -y -q gcc libssl-dev libpq-dev default-libmysqlclient-dev pkg-config

# poetry install takes a long time and can be cached if dependencies don't change,
# so that's why we tolerate running it twice.
COPY pyproject.toml poetry.lock /app/
RUN poetry install --without dev

COPY . /app
RUN poetry install --without dev

# Final image without setup dependencies.
FROM deployment AS final

LABEL source="https://github.com/sartography/spiff-arena"
LABEL description="Backend component of SpiffWorkflow, a software development platform for building, running, and monitoring executable diagrams"

COPY --from=setup /app /app

CMD ["./bin/boot_server_in_docker"]
