# TP CI/CD avec Jenkins

Ce projet est un exercice de mise en place d'une pipeline CI/CD avec Jenkins, Docker et GitHub Container Registry (GHCR).

## 🛠️ Stack utilisée

- Jenkins (dans un container Docker local)
- Node.js (pour exécuter les tests)
- Docker
- GitHub + GitHub Container Registry (GHCR)

## 📁 Arborescence
```
jenkins-test/
├── src/
│ └── sum.js
├── tests/
│ └── sum.test.js
├── Jenkinsfile
└── package.json
```
## 📌 Objectif

Mettre en place une pipeline Jenkins qui :

1. Clone le projet depuis GitHub
2. Installe les dépendances
3. Lance les tests
4. Crée une image Docker
5. Push l’image sur GHCR
6. Tag le dépôt avec le numéro de version

## 🔁 Pipeline Jenkins

### Configuration utilisée

- **SCM :**
    - Repo : `https://github.com/maelbadet/jenkins-test`
    - Credentials : `maelbadet/<token>` (configuré dans Jenkins)
- **Credentials ajoutés dans Jenkins :**
    - `github-creds` : pour le push de tags
    - `ghcr-creds` : pour le `docker login` à GHCR

### Jenkinsfile

```groovy
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
        nodejs "npm" // Doit être configuré dans Jenkins > Tools
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
                    credentialsId: 'github-creds',
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
```