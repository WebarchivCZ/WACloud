#!/bin/sh
cd /root
yarn build

mv build/* /var/www/localhost/htdocs

if [ -z $API_HOST ]; then 
    API_HOST=localhost
fi
echo $API_HOST

cat <<EOT >> /etc/apache2/conf.d/proxy-api.conf
ProxyPass "/api" "http://$API_HOST:8080/api"
ProxyPassReverse "/api" "http://$API_HOST:8080/api"
EOT

cat <<EOT > /etc/apache2/conf.d/rewrite.conf
<Directory "/var/www/localhost/htdocs">
    RewriteEngine on
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    RewriteRule ^ index.html [L]
</Directory>
EOT

sed -i '/LoadModule rewrite_module/s/^#//g' /etc/apache2/httpd.conf

chown -R apache:apache /var/www/localhost
cd /
httpd -D FOREGROUND
tail -f /etc/issue
