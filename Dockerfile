FROM ruby:3.2

RUN bundle config --global frozen 1

WORKDIR /srv/jekyll

COPY Gemfile Gemfile.lock ./

RUN gem install bundler jekyll

RUN bundle install
