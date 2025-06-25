pipeline {
  agent any

  steps {
      sh 'docker build -t my-node-app .'
   }

  environment {
    GITHUB_CREDS = credentials('jenkins_token')  // Tes credentials Github dans Jenkins
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', credentialsId: 'jenkins_token', url: 'https://github.com/maelbadet/jenkins-test.git'
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
      when {
        branch 'main'
      }
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
