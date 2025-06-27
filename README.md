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

```

### etape par etape du Jenkisfile : 

```groovy
pipeline {
    agent any
```
utilise n'importe quel agent Jenkins (sur un node ou un docker)

```groovy
environment {
        GITHUB_USER = 'maelbadet'
        IMAGE_NAME = "${GITHUB_USER}/jenkins-test"
        REGISTRY = "ghcr.io"
        VERSION = "v${BUILD_NUMBER}"
        DOCKER_IMAGE = "${REGISTRY}/${IMAGE_NAME}:${VERSION}"
    }
```
definit les variables utilsie tout au long de la pipeline :
- GITHUB_USER : mon user de connexion github
- IMAGE_NAME : construit le nom de l'image Docker maelbadet/jenkins-test
- REGISTRY : centralise les informations pour les futurs commandes docker dans la pipeline
- VERSION : tag de version, elle est fournis automatiquement par jenkins lors de chaque pipeline (la version evite les collisions d'images)
- DOCKER_IMAGE : Assemble toutes les parties précédentes pour former l’identifiant complet de l’image Docker

```groovy
    tools {
        nodejs "npm"
    }
```
utilise la version node que j'ai declarer `npm` dans la conf jenkins

la `stages` englobe toutes les etapes de la pipeline CI/CD : 
- installer les dependences
- executer les tests
- construire une image docker
- conexion au docker container registry
- envoie de l'image docker dans le github container registry
- creer un tag pour la pipeline

### lancer le container jenkins

pour lancer le container jenkins, j'ai besoin de la commande :
```bash
docker run -d \
  --name jenkins-docker \
  -p 8080:8080 -p 50000:50000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins_home:/var/jenkins_home \
  --group-add=$(getent group docker | cut -d: -f3) \
  jenkins-dind

```
les etapes du docker run : 
- -d : lance en mode detacher (sans les logs)
- --name : donne le nom jenkins-docker au container
- -p 8080:8080 -p 50000:50000 : attribue les ports respectif pour lancer jenkins
- -v /var/run/docker.sock:/var/run/docker.sock : monte le socket docker sur le container (permet d'executer les commandes docker dans un script CI/CD)
- -v jenkins_home:/var/jenkins_home : creer un volume pour si le /var/jenkins_home est supprimer
- --group-add= : ajoute le container au gorupe docker de l'hote
  - $(getent group docker | cut -d: -f3)
  - getent group docker : cherche le groupe docker sur le system
  - cut -d: -f3 : recupere l'id du groupe

cette commande permet de resoudre le probleme de droit d'acces sur le script Jenkinsfile
- jenkins-dind : nom de l'image utiliser

test test