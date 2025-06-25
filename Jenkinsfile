pipeline {
  agent any

  environment {
    GITHUB_CREDS = credentials('jenkins-token')
  }

  stages {
    stage('Checkout') {
      steps {
        git credentialsId: 'jenkins-token', url: 'https://github.com/maelbadet/my-node-app.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'npm test'
      }
    }

    stage('Tag and Push') {
      steps {
        script {
          def tag = "build-${env.BUILD_NUMBER}"
          sh """
            git config user.email "maelbadet21@gmail.com"
            git config user.name "maelbadet"
            git tag -a ${tag} -m "Build ${env.BUILD_NUMBER}"
            git push https://${GITHUB_CREDS_USR}:${GITHUB_CREDS_PSW}@github.com/maelbadet/my-node-app.git --tags
          """
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t my-node-app .'
      }
    }
  }
}
