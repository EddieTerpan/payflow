run-dev: docker compose -f docker-compose.dev.yml up --build
migrate-mysql:
	docker exec -it ensuria-payflow-api-dev npm run mig:run

