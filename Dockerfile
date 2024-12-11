# Base image
FROM php:8.3.14-apache

# Information
LABEL maintainer="Slow Ninja <info@slow.ninja>"

# Install symfony package dependencies
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
        git \
        p7zip-full \
        libpq-dev && \
    docker-php-ext-install pdo pdo_pgsql

# Install symfony php extension dependences
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions intl

# Install composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php && \
    php -r "unlink('composer-setup.php');" && \
    mv composer.phar /usr/local/bin/composer

# Setup git globals for symfony
RUN git config --global user.email structs-webapp@slow.ninja && \
    git config --global user.name structs-webapp

# Install symfony
RUN curl -sS https://get.symfony.com/cli/installer | bash && \
    mv /root/.symfony5/bin/symfony /usr/local/bin/symfony

# Set the document root
ENV APACHE_DOCUMENT_ROOT /src/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

#enable mod_rewrite
RUN a2enmod rewrite

# Copy the source files from the local machine to the container
COPY ./src /src

WORKDIR /src

# Install project dependencies
#RUN bash -c "composer update"