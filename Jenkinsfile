#!/usr/bin/groovy

node {
  def root = pwd()

  stage('Setup') {
    git url: 'https://github.com/StatEngine/stat-engine', branch: 'master'
  }

  stage('Archive') {
    sh """
      env
      echo "npm install"
      echo "tar it up"
      echo "./bin/s3Push.sh"
    """
  }
}
