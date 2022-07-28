FROM zenika/alpine-chrome:with-puppeteer

USER root
RUN mkdir -p /home/chrome/wacheck/src/
RUN mkdir -p /home/chrome/wacheck/app/
COPY ./src/ /home/chrome/wacheck/src/
COPY ./app/ /home/chrome/wacheck/app/
COPY ./package.json /home/chrome/wacheck/
COPY ./index.d.ts /home/chrome/wacheck/
COPY ./index.js /home/chrome/wacheck/
RUN mkdir -p /home/chrome/wacheck/app/check/.wwebjs_auth

RUN chown -R chrome /home/chrome/wacheck
USER chrome

WORKDIR /home/chrome/wacheck/
RUN npm install

WORKDIR /home/chrome/wacheck/app/check/

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "node main.js"]
