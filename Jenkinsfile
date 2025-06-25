pipeline {
    agent any

    tools {
        nodejs "NodeJS 24" // Tu dois avoir défini ce nom dans Jenkins -> Global Tool Configuration
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
