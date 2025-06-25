pipeline {
    agent any

    environment {
        GIT_REPO = "https://github.com/maelbadet/newPortfolio.git"
        GIT_CREDENTIALS = credentials('github-creds')
        GITHUB_TOKEN = credentials('GITHUB_TOKEN')
        IMAGE_NAME = "ghcr.io/maelbadet/newportfolio"
    }

    stages {
        stage('Checkout') {
            steps {
                git url: "${env.GIT_REPO}", credentialsId: 'github-creds'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install' // ou autre, selon ton projet
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test || exit 1' // fail si test échoue
            }
        }

        stage('Tag and Push') {
            steps {
                script {
                    def tag = "build-${env.BUILD_NUMBER}"
                    sh """
                        git config user.name "${GIT_CREDENTIALS_USR}"
                        git config user.email "jenkins@example.com"
                        git tag -a ${tag} -m "Build ${env.BUILD_NUMBER}"
                        git push https://${GIT_CREDENTIALS_USR}:${GIT_CREDENTIALS_PSW}@github.com/maelbadet/newPortfolio.git --tags
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${env.BUILD_NUMBER} ."
            }
        }

        stage('Push Docker Image to GHCR') {
            steps {
                withDockerRegistry([credentialsId: 'GITHUB_TOKEN', url: 'https://ghcr.io']) {
                    sh "docker tag ${IMAGE_NAME}:${env.BUILD_NUMBER} ${IMAGE_NAME}:latest"
                    sh "docker push ${IMAGE_NAME}:${env.BUILD_NUMBER}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline terminé avec succès."
        }
        failure {
            echo "Le pipeline a échoué."
        }
    }
}
