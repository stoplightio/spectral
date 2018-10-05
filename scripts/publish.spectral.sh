#!/bin/bash
set -ex

branch="$(git rev-parse --abbrev-ref HEAD)"
package="@stoplight/spectral"
pre_release_branch="develop"
release_branch="master"

which semver &>/dev/null || exit 1

# capture config option so we can set it back when we're done
original_version_tag_config="$(yarn config get version-git-tag -s 2>/dev/null)"
# disable automatic tagging and commit messages
yarn config set version-git-tag false

# capture the current version (by tag, not based on the version listed in the
# package.json)
latest_version="$(semver $(git describe --tags $(git rev-list --tags --max-count=1)))"
latest_major=$(echo ${latest_version[@]:0:1})
latest_minor=$(echo ${latest_version[@]:2:1})

# capture the current version in package.json
pkg_version=$(yarn version --non-interactive 2>/dev/null | awk '/Current version/ { print $4 }')
pkg_major=$(echo ${pkg_version[@]:0:1})
pkg_minor=$(echo ${pkg_version[@]:2:1})

if [[ (${latest_major} != ${pkg_major}) || (${latest_minor} != ${pkg_minor}) ]]; then
	# if package.json major-minor version differs from git version, use package.json
	latest_version=${pkg_version}
else
	# otherwise rely on latest git tag
	latest_version=${latest_version}
fi

case "${branch}" in
"${pre_release_branch}")
	# pre-release versioning
	tag="next"
	if [[ "${latest_version}" == *"beta"* ]]; then
		version="$(semver --increment prerelease --preid beta ${latest_version})"
	else
		# No beta present in pre-release version, so we must have pushed a
		# release. If so, increment the patch and add a pre-release version.
		inc_version="$(semver --increment patch ${latest_version})"
		version="${inc_version}-beta.1"
	fi
	;;
"${release_branch}")
	# release versioning
	tag="latest"
	version="$(semver --increment patch ${latest_version})"
	;;
*)
	echo "Nothing to do for branch: ${branch}"
	exit 0
	;;
esac

# sanity checks before publishing
if [[ -z "${version}" ]]; then
	echo "FATAL - No version provided to publish command. Are we on the right branch?"
	exit 1
elif [[ -z "${tag}" ]]; then
	echo "FATAL - No tag provided to publish command. Are we on the right branch?"
	exit 1
fi

# set new version in package.json
yarn version --new-version ${version} -s
# tag the current commit - note, that we do this outside of yarn so that we
# don't create a separate commit for the tag (which will lead to conflicts when
# future changes are merged)
git tag v${version}

echo "Publishing ${package} with version: ${version} (tag: ${tag})"
yarn publish --non-interactive --tag ${tag} --access restricted

# when deploying to production, also tag this version as next
if [[ "${branch}" == "${release_branch}" ]]; then
	echo "Also tagging as: next"
	yarn tag add ${package}@${version} next
fi

# set config option back to whatever it was originally set to
yarn config set version-git-tag ${original_version_tag_config}

exit 0
