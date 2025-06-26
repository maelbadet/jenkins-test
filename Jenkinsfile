pipeline {
    agent any

    tools {
        nodejs "npm" // Remplace par le vrai nom défini dans Jenkins
    }

    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }
    }
}
