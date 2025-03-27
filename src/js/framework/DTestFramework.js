export class DTestAssertError extends Error {
  constructor(message) {
    super(message);
    this.name = "DTestAssertError";
  }
}

export class DTest {
  constructor(testName, test, provider = null) {
    this.numAssertions = 0;
    this.testName = testName;
    this.test = test.bind(this);
    this.provider = provider;
  }

  assertEquals(a, b) {
    if (a !== b) {
      throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
    }
    this.numAssertions++;
  }

  assertArrayEquals(a, b) {
    if (a.length !== b.length) {
      throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
      }
    }

    this.numAssertions++;
  }

  assertSetEquality(a, b) {
    if (!(a.every(element => b.includes(element)) && b.every(element => a.includes(element)))
        || a.length !== b.length) {
      throw new DTestAssertError(`${JSON.stringify(a)} is not equal to ${JSON.stringify(b)}`);
    }

    this.numAssertions++;
  }

  run() {
    let successfulProviderTests = 0;
    let totalProviderTests = 0;
    let providerMessage = '';

    try {

      if (typeof this.provider === 'function') {

        // Running a test with a provider
        const testParamSets = this.provider();
        totalProviderTests = testParamSets.length;

        for (let i = 0; i < totalProviderTests; i++) {
          providerMessage = `${successfulProviderTests}/${totalProviderTests} Provider Test(s) Passed -`;

          this.test(testParamSets[i]);

          successfulProviderTests++;
        }
      } else {
        // Running a test without a provider
        this.test();
      }

      // If a test has no assertions, it's considered a failure
      if (this.numAssertions === 0) {
        console.log(this.testName, ' - ', new DTestAssertError('Test has no assertions.'));
        return false;
      }

      // All assertions passed
      console.log(this.testName, ' - ', `${this.numAssertions} Assertion(s) Passed`);
      return true;

    } catch (err) {
      console.log(this.testName, ' - ', providerMessage, err);
      return false;
    }
  }
}

export class DTestSuite {

  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * @param suiteName
   */
  printSuiteHeader(suiteName) {
    const horizontalBorder = '-'.repeat(suiteName.length + 4);
    console.log('');
    console.log(horizontalBorder);
    console.log(`| ${suiteName} |`);
    console.log(horizontalBorder);
  }

  run() {
    this.printSuiteHeader(this.name);

    for (const property in this) {
      if (this.hasOwnProperty(property) && this[property] instanceof DTest) {
        this[property].run();
      }
    }
  }
}
