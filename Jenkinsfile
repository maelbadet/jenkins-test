pipeline {
    agent any

    environment {
        VERSION = "v${BUILD_NUMBER}"
    }

    tools {
        nodejs "npm"
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
