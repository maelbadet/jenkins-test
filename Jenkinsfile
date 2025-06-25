pipeline {
  agent any

  environment {
    GITHUB_CREDS = credentials('jenkins_token')
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', credentialsId: 'jenkins_token', url: 'https://github.com/maelbadet/jenkins-test.git'
      }
    }

    // Étapes Node.js dans un container docker node:18
    stage('Install and Test') {
      agent {
        docker {
          image 'node:18'
          args '-v $HOME/.npm:/root/.npm'  // optionnel, cache npm local
        }
      }
      steps {
        sh 'npm install'
        sh 'npm test'
      }
    }

    stage('Tag and Push') {
      when { branch 'main' }
      steps {
        script {
          def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          def tag = "build-${commitHash}"
          sh "git tag ${tag}"
          sh "git push origin ${tag}"
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
