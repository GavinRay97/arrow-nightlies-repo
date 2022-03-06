# Arrow Nightly Java releases to Maven M2 Repo extractor

Takes the URL to the Arrow nightly java jar releases, and downloads them into a proper M2 repo format for use as a Maven repository.

Originally created due to FlightSQL not being available in Arrow v7.0.0 releases so that I could experiment with it:
- https://lists.apache.org/thread/fbrgvf30os5h4ox7fk4txrlgdp1g5g4g

To run:
- `yarn install`
- `yarn start`

# Use with gradle
```groovy
repositories {
  // important: this repo has to come last
  maven {
    name "arrow-nightly"
    url "https://raw.github.com/GavinRay97/arrow-nightlies-repo/master/m2repo/"
  }
}
```

# Use with Maven
```xml
<repositories>
  <repository>
    <id>arrow-nightly</id>
    <url>https://raw.github.com/GavinRay97/arrow-nightlies-repo/master/m2repo/</url>
  </repository>
</repositories>
```