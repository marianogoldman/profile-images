ARG RUN

FROM node:lts as builderenv

WORKDIR /app

# some packages require a build step
RUN apt-get update
RUN apt-get -y -qq install python-setuptools python-dev build-essential

# specific for Chromium
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
      gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
      libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
      libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
      libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release \
      xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# We use Tini to handle signals and PID1 (https://github.com/krallin/tini, read why here https://github.com/krallin/tini/issues/8)
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# install dependencies
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
RUN yarn

# build the app
COPY . /app
RUN yarn build
#RUN npx browserslist@latest --update-db
#RUN yarn test

# remove devDependencies, keep only used dependencies
RUN yarn --prod



### This should be in next build stage
ENV NODE_ENV production

ENTRYPOINT ["/tini", "--"]
# Run the program under Tini
CMD [ "/usr/local/bin/node", "--trace-warnings", "--abort-on-uncaught-exception", "--unhandled-rejections=strict", "dist/index.js" ]

########################## END OF BUILD STAGE ##########################

#FROM node:lts
#
## NODE_ENV is used to configure some runtime options, like JSON logger
#ENV NODE_ENV production
#
#WORKDIR /app
#
#COPY --from=builderenv /home /home
#COPY --from=builderenv /app /app
#COPY --from=builderenv /tini /tini
#
### Run everything after as non-privileged user.
##USER pptruser
##
##RUN groupadd -r pptruser \
##    && useradd -r -g pptruser -G audio,video pptruser \
##    && mkdir -p /home/pptruser/Downloads \
##    && chown -R pptruser:pptruser /home/pptruser \
##    && chown -R pptruser:pptruser /app/node_modules \
##    && chown -R pptruser:pptruser /app/package.json \
##    && chown -R pptruser:pptruser /app/yarn.lock
#
## Please _DO NOT_ use a custom ENTRYPOINT because it may prevent signals
## (i.e. SIGTERM) to reach the service
## Read more here: https://aws.amazon.com/blogs/containers/graceful-shutdowns-with-ecs/
##            and: https://www.ctl.io/developers/blog/post/gracefully-stopping-docker-containers/
#ENTRYPOINT ["/tini", "--"]
## Run the program under Tini
#CMD [ "/usr/local/bin/node", "--trace-warnings", "--abort-on-uncaught-exception", "--unhandled-rejections=strict", "dist/index.js" ]
