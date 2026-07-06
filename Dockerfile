FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npx expo export --platform web

FROM node:20-alpine

WORKDIR /app
COPY backend/package.json ./backend/
RUN cd backend && npm install --omit=dev

COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist/

ENV PORT=8851
ENV HOST=0.0.0.0
ENV DB_DIR=/data/ExerciseDiary

EXPOSE 8851

CMD ["node", "backend/src/index.js"]
