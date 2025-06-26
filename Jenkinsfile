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

        stage('Tag Git repo') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'jenkins_token',
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        rm -rf jenkins-test
                        git clone https://$GIT_USERNAME:$GIT_TOKEN@github.com/maelbadet/jenkins-test.git
                        cd jenkins-test
                        git config user.name "$GIT_USERNAME"
                        git config user.email "$GIT_USERNAME@users.noreply.github.com"
                        git tag $VERSION
                        git push origin $VERSION
                    '''
                }
            }
        }
    }
}
