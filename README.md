# Martellone Alexa Skill

> Alexa, ask Martellone what does he think about it

![image](./skill-package/assets/martellone-icon-small.png)

Skill created as a tribute to the mythological [Nando Martellone](https://www.youtube.com/watch?v=l0kKxkulOiI), character of the TV Show [Boris](<https://en.wikipedia.org/wiki/Boris_(TV_series)>).

## Link to the Store

### [Amazon UK](https://www.amazon.co.uk/sirLisko-Martellone-Boris/dp/B08C7SHW3T/)

### [Amazon IT](https://www.amazon.it/sirLisko-Martellone-Boris/dp/B08C7SHW3T/)

## Project structure

| Path                           | What                                                                 |
| ------------------------------ | -------------------------------------------------------------------- |
| `lambda/`                      | Skill handler (TypeScript, `ask-sdk-core`) and its tests             |
| `skill-package/`               | Skill manifest, interaction models (`en-GB`, `it-IT`) and icons      |
| `hooks/build.sh`               | Bundles the handler with esbuild; called by `ask deploy`             |
| `ask-resources.json`           | ASK CLI deploy config, pointing at the existing Lambda in `eu-west-1` |
| `audio/sticazzi.mp3`           | The clip, served from S3                                             |

## Setup

Requires Node 24, the [ASK CLI](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html) and AWS credentials.

```sh
npm install
npm install -g ask-cli
ask configure   # links your Amazon developer account and an AWS profile
```

The ASK CLI keeps the skill ID in `.ask/ask-states.json`, which is gitignored. On a fresh clone create it:

```json
{
  "askcliStatesVersion": "2020-03-31",
  "profiles": {
    "default": { "skillId": "amzn1.ask.skill.af6eec0b-a4dc-46a7-9aa6-00bcb82aab1f" }
  }
}
```

## Development

```sh
npm test            # handler tests
npm run typecheck
```

## Deploy

```sh
ask deploy --target skill-infrastructure   # Lambda code only: goes live straight away
ask deploy                                 # Lambda + manifest + models (development stage)
```

Manifest and interaction model changes only reach users after submitting the skill for certification:

```sh
ask smapi submit-skill-for-certification -s <skill-id>
```

## Audio

Alexa SSML `<audio>` requires an HTTPS MP3 at 48 kbps and 16/22.05/24 kHz. The clip lives in the `martellone-alexa-skill-audio` S3 bucket, where only that object is publicly readable. To replace it:

```sh
aws s3 cp audio/sticazzi.mp3 s3://martellone-alexa-skill-audio/sticazzi.mp3 \
  --content-type audio/mpeg --cache-control "public, max-age=31536000"
```
