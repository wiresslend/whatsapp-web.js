FROM zenika/alpine-chrome:with-puppeteer

USER root
RUN mkdir -p /home/chrome/wacheck/
RUN mkdir .config/
COPY ./ /home/chrome/wacheck/


RUN chown -R chrome /home/chrome/wacheck
USER chrome

WORKDIR /home/chrome/wacheck/
RUN npm install

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "node main.js"]
