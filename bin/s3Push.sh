#!/bin/bash -e

type git >/dev/null 2>&1 || { echo "$0: git not available" >&2; exit 1; }
type aws >/dev/null 2>&1 || { echo "$0: aws not available" >&2; exit 1; }

test -n "$ARTIFACT_BUCKET" || { echo "$0: ARTIFACT_BUCKET not defined" >&2; exit 1; }

: ${APP:=statengine}
: ${PACKAGING:=bz2}
: ${DEPLOY_LATEST:=true}

test -n "$PACKAGING" && extension=".$PACKAGING" || extension=
test -n "$VERSION" || export VERSION=$(git describe --long --tags --always) || true
test -n "$ARTIFACT"|| export ARTIFACT=${APP}${extension} || true

test -f "$ARTIFACT" || { echo "$0: $ARTIFACT not found" >&2; exit 1; }

function git_branch {
  local sym=$(git symbolic-ref HEAD 2>/dev/null)
  test -n "$sym" || sym=$(git describe --contains --all HEAD)
  test -n "$sym" || sym=$(git rev-parse --short HEAD)
  echo ${sym##refs/heads/}
}

function os_name {
  local os

  test -f /etc/os-release \
    && os=$(cat /etc/os-release | grep -i -e centos -e amazon -m 1 -o) \
    || os=$(uname -s)

  echo $os | tr '[:upper:]' '[:lower:]'
}

function metadata {
  local handle
  handle=$(mktemp)

  cat <<- EOF > $handle
  {
    "app": "$APP",
    "packaging": "$PACKAGING",
    "version": "$VERSION",
    "commit": "$GIT_COMMIT",
    "branch": "$GIT_BRANCH",
    "build_os": "$OPERATING_SYSTEM"
  }
  EOF

  echo $handle
}

test -n "$OPERATING_SYSTEM" || OPERATING_SYSTEM=$(os_name)
test -n "$GIT_BRANCH" || GIT_BRANCH=$(git_branch)
test -n "$GIT_COMMIT" || GIT_COMMIT=$(git log -n1 --pretty=format:%H)

aws s3 cp $ARTIFACT s3://${ARTIFACT_BUCKET}/${APP}/${OPERATING_SYSTEM}/${GIT_BRANCH}/${GIT_COMMIT}/$APP${extension}

aws s3 cp $(handle) s3://${ARTIFACT_BUCKET}/${APP}/${OPERATING_SYSTEM}/${GIT_BRANCH}/${GIT_COMMIT}/$APP.metadata.json

if [ "$DEPLOY_LATEST" = "true" ]; then
  aws s3 cp $ARTIFACT s3://${ARTIFACT_BUCKET}/${APP}/${OPERATING_SYSTEM}/${GIT_BRANCH}/latest/$APP${extension}
  aws s3 cp $(handle) s3://${ARTIFACT_BUCKET}/${APP}/${OPERATING_SYSTEM}/${GIT_BRANCH}/ltest/$APP.metadata.json
fi
