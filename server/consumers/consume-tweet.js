import { Tweet } from '../sqldb';

export function consumeTweet(msg, done) {
  const newTweet = Tweet.build(JSON.parse(msg.content.toString()));

  return newTweet.save()
    .then(() => {
      console.log('Tweet added');
      done();
    })
    .catch(err => {
      console.error('Error saving tweet');
      done(err);
    });
}

export default consumeTweet;
