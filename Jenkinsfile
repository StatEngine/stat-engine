#!/usr/bin/groovy

node {
  def root = pwd()

  stage('Setup') {
    git url: 'https://github.com/StatEngine/stat-engine', branch: 'master'
  }

  stage('Archive') {
    sh """
      test -f /etc/runtime && source /etc/runtime

      npm install
      mkdir -p artifacts
      tar --exclude artifacts/* -cjf artifacts/statengine.bz2

      export ARTIFACT=artifacts/statengine.bz2

      ./bin/s3Push.sh
    """
  }
}
