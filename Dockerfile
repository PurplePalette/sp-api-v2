FROM node:14-alpine AS BUILD
WORKDIR /app
# Install development dependencies
COPY package.json /app
COPY yarn.lock /app
RUN yarn install
# Install sonolus-pack for building pack
RUN npm install --global --unsafe-perm sonolus-pack
# Build app
COPY . /app
RUN yarn run build
# Run sonolus-pack
RUN /usr/local/bin/sonolus-pack -i /app/db/source -o /app/db/pack

FROM node:14-alpine AS RUNNER
WORKDIR /usr/src/app
# Create empty folders (mount as volume later)
RUN mkdir -p /usr/src/app/db/levels
RUN mkdir -p /usr/src/app/db/users
RUN mkdir -p /usr/src/app/db/pack
RUN mkdir -p /usr/src/app/config
# Install production dependencies
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
RUN yarn install --production
# Copy built files
COPY --from=build /app/dist /usr/src/app
# Copy packed files
COPY --from=build /app/db/pack /usr/src/app/db/pack
# Copy api spec
COPY api.yaml /usr/src/app
# Define container entrypoint
EXPOSE 3000
VOLUME ["/usr/src/app/db", "/usr/src/app/config", "/usr/src/app/static"]
CMD [ "npm", "start" ]