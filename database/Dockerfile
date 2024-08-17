# Use an official Alpine as a parent image
FROM alpine:latest

# Set the working directory
WORKDIR /app

# Create the backups directory
RUN mkdir -p /app/backups

# Copy the file end with .tar.bz2 to the container
COPY ./backup/*.tar.bz2 /app/backups/

# Command to run when the container starts
CMD ["sh"]