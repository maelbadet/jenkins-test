pipeline {
    agent any

    environment {
        GITHUB_USER = 'maelbadet'
        IMAGE_NAME = "${GITHUB_USER}/jenkins-test"
        REGISTRY = "ghcr.io"
        VERSION = "v${BUILD_NUMBER}"
        DOCKER_IMAGE = "${REGISTRY}/${IMAGE_NAME}:${VERSION}"
    }

    tools {
        nodejs "npm"
    }

    stages {
        stage('Clone') {
            steps {
                git url: 'https://github.com/maelbadet/jenkins-test.git', branch: 'main'
            }
        }

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

        stage('Docker build') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE .'
            }
        }

        stage('Docker login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'ghcr-creds',
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'TOKEN'
                )]) {
                    sh 'echo $TOKEN | docker login $REGISTRY -u $USERNAME --password-stdin'
                }
            }
        }

        stage('Docker push') {
            steps {
                sh 'docker push $DOCKER_IMAGE'
            }
        }

        stage('Tag Git repo') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'jenkins_token',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        git config user.name "$GIT_USERNAME"
                        git config user.email "$GIT_USERNAME@users.noreply.github.com"
                        git tag $VERSION
                        git remote set-url origin https://$GIT_USERNAME:$GIT_TOKEN@github.com/maelbadet/jenkins-test.git
                        git push origin $VERSION
                    '''
                }
            }
        }
    }
}