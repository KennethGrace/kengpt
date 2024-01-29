#!/bin/sh

# Replace the {{ API_SERVER_URL }} variable in the NGINX config Jinja template
# with the value of the API_SERVER_URL environment variable. The
# API_SERVER_URL environment variable is set at runtime by the Docker
# container. The NGINX config Jinja template is located at
# /etc/nginx/nginx.conf.j2

# Check if the API_SERVER_URL environment variable is set
if [ -z "$API_SERVER_URL" ]; then
  echo "API_SERVER_URL environment variable is not set."
  exit 1
fi

# Replace the {{ API_SERVER_URL }} variable in the NGINX config Jinja template
sed -i "s|{{ API_SERVER_URL }}|$API_SERVER_URL|g" /etc/nginx/nginx.conf.j2

# Rename the NGINX config Jinja template to a NGINX config file
mv /etc/nginx/nginx.conf.j2 /etc/nginx/conf.d/default.conf

# Start NGINX
nginx -g 'daemon off;'