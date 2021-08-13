import * as base64url from 'base64-url'
import { createHash } from 'crypto'
import { sign } from 'jsonwebtoken'
import * as forge from 'node-forge'
import NodeRSA from 'node-rsa'

/* HARDCODED MOCK RSA KEYS */

const PRIVATE_KEY_PEM =
  '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIIEpAIBAAKCAQEApoocpO3bbUF6o8eyJlQCfwLahEsunWdVF++yOEyKu4Lp1j0m\n' +
  '2j/P7iHOtxBAkjdM2X2oW3qO1mR0sIFefqnm93g0q2nRuYEoS+W3o6X50wjOVm8f\n' +
  'r/tLqELzy5BoET0AQl7Axp1DNsb0HNOBcoIBt+xVY4I+k6uXJJJMzbgvahAgSLZ9\n' +
  'RW0Z0WT+dCHZpZUj0nLxNXIPdci65Bw6IognqXHP6AwKZXpT6jCzjzq9uyHxVcud\n' +
  'qw6j0kQw48/A5A6AN5fIVy1cKnd0sKdqRX1NUqVoiOrO4jaDB1IdLD+YmRE/JjOH\n' +
  'sWIMElYCPxKqnsNo6VCslGX/ziinArHhqRBrHwIDAQABAoIBAHAdmpsN5iLvafjI\n' +
  'f45+EBAhg6p8Uq102zx6CakNHniN8Y5hLL7RJtJRwDBNqKrGv93LUoQDRhXfGw+Y\n' +
  'iF0NVIhVTF/5pU8VPGOcCr0JB96ilwZpWRPIQW7NZAMu/GBeiMYls/IB/TXrSnv9\n' +
  'h6/nBfEkEXgkPqx7YA0m0L3NuV3U1lCY/LhBJY4Xvi0uRdqu3tTHXftehuPwC4UB\n' +
  '42eJTWv/qLeOlkCdUUV4f7+dNaES88Vdhj6lu/BusnNhvnwHQik4dNwzPCGeP8NV\n' +
  '5gaesWiNWFZuTURGKk1B65p5LzNPjsVT50RDuW8FnSZwIvNcohrX9ILPsmg/t0Kr\n' +
  'ozcOksECgYEA4XWOK4twx5RG162zveRHqU7H9RBWSz7/PzM9Eob9vx/tC/b1YqBR\n' +
  'VShk23vje19eNiYWAkxcpobIP4ek/0ZT8nHkJg8wl+J/hnXADcvwv2dKnoFnm5pn\n' +
  'rTBUKc8R3wrSlAV8XQAtdnxsfFa5AOQJ6WFVI9AdfH3Iw8XZk4gIIPMCgYEAvRlY\n' +
  'y80HnR3kwMOqY488V1qk41dmfNqa+YDL+zkPF1HhHI9VnK5BQuI7lyKJl984KwHu\n' +
  '0gbwx3Wp4XkD5JUboEpl5LnaLsjEWemjTaQWdvJHPd5wkJ0m/jRQ2YeT4g2gFu4y\n' +
  'Pi/pWkrzhnzQQVAmOdAm5Kj27LtDzp0lspw3uCUCgYEAw2YdvFGSgfZZW4147QeO\n' +
  'sAbON+9bysUjdMPUl10VR/LEgA0d6MdnFfX3S13Y7tDdlvJ1OrKxzcWcgaru7ism\n' +
  'kEXy5KVfiRNNUNx2gb6RvWEpA6zFfc9ZMXlkSAPlyjfX/1+tw/Bmdn0pjK2gk0wP\n' +
  '5wtrPameFInzWPD9O+a2nM8CgYBZ6UhgNs+M9B7FTQOiLQPa4R2PfwobCXIwef4D\n' +
  'KIE1bFgl1T02r2AWZi1BUkmr7ZXuVQ/xyx0HKbopm/mu4PruvxEtrPTB0/IQcleU\n' +
  'XhXUXqRjFXXePOrCaaubkqxNCn95B67aBLvmk8awxn3a4DocuQ0VIgWuT+gQwIWh\n' +
  'JEgWBQKBgQDKD+2Yh1/rUzu15lbPH0JSpozUinuFjePieR/4n+5CtEUxWJ2f0WeK\n' +
  's4XWWf2qgUccjpiGju2UR840mgWROoZ8BfSTd5tg1F7bo0HMgu2hu0RIRpZcRhsA\n' +
  'Cd0GrJvf1t0QIdDCXAy+RpgU1SLSq4Q6Lomc0WA5C5nBw9RKEUOV9A==\n' +
  '-----END RSA PRIVATE KEY-----\n'

const PUBLIC_KEY_PEM =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApoocpO3bbUF6o8eyJlQC\n' +
  'fwLahEsunWdVF++yOEyKu4Lp1j0m2j/P7iHOtxBAkjdM2X2oW3qO1mR0sIFefqnm\n' +
  '93g0q2nRuYEoS+W3o6X50wjOVm8fr/tLqELzy5BoET0AQl7Axp1DNsb0HNOBcoIB\n' +
  't+xVY4I+k6uXJJJMzbgvahAgSLZ9RW0Z0WT+dCHZpZUj0nLxNXIPdci65Bw6Iogn\n' +
  'qXHP6AwKZXpT6jCzjzq9uyHxVcudqw6j0kQw48/A5A6AN5fIVy1cKnd0sKdqRX1N\n' +
  'UqVoiOrO4jaDB1IdLD+YmRE/JjOHsWIMElYCPxKqnsNo6VCslGX/ziinArHhqRBr\n' +
  'HwIDAQAB\n' +
  '-----END PUBLIC KEY-----\n'

const JWKS_CONST:JWKS =  {
    keys:[
        {
            alg:"RSA256",
            e:"65537",
            kid:"eGs0S2paTkZ5TFVxVU9XUm1LMXBFd1JPVDZZPQ",
            kty:"RSA",
            n:"AKaKHKTt221BeqPHsiZUAn8C2oRLLp1nVRfvsjhMiruC6dY9Jto/z+4hzrcQQJI3TNl9qFt6jtZkdLCBXn6p5vd4NKtp0bmBKEvlt6Ol+dMIzlZvH6/7S6hC88uQaBE9AEJewMadQzbG9BzTgXKCAbfsVWOCPpOrlySSTM24L2oQIEi2fUVtGdFk/nQh2aWVI9Jy8TVyD3XIuuQcOiKIJ6lxz+gMCmV6U+ows486vbsh8VXLnasOo9JEMOPPwOQOgDeXyFctXCp3dLCnakV9TVKlaIjqzuI2gwdSHSw/mJkRPyYzh7FiDBJWAj8Sqp7DaOlQrJRl/84opwKx4akQax8=",
            use:"sig",
            x5c:["MIICqjCCAZKgAwIBAgICASMwDQYJKoZIhvcNAQEFBQAwADAeFw0yMTA4MTMxODUxNDBaFw0yMjA4MTMxODUxNDBaMDAxLjAsBgNVBAMTJWh0dHBzOi8vZmluYXZvLWRldmVsb3BtZW50LmF1dGgwLmNvbS8wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCmihyk7dttQXqjx7ImVAJ/AtqESy6dZ1UX77I4TIq7gunWPSbaP8/uIc63EECSN0zZfahbeo7WZHSwgV5+qeb3eDSradG5gShL5bejpfnTCM5Wbx+v+0uoQvPLkGgRPQBCXsDGnUM2xvQc04FyggG37FVjgj6Tq5ckkkzNuC9qECBItn1FbRnRZP50IdmllSPScvE1cg91yLrkHDoiiCepcc/oDAplelPqMLOPOr27IfFVy52rDqPSRDDjz8DkDoA3l8hXLVwqd3Swp2pFfU1SpWiI6s7iNoMHUh0sP5iZET8mM4exYgwSVgI/Eqqew2jpUKyUZf/OKKcCseGpEGsfAgMBAAEwDQYJKoZIhvcNAQEFBQADggEBAFLBR27v7wJgo3N1hq/zvThA61jEw+KcAaoSo4piDLyp/bSZyFf9+gcM7YKMsCQfcybwlldVXOQ73HMSXR0opr2wH2MqBZQpHiHb6x0T1H4uVsrD9Xb1JPSbRi8YnmpohCPpat0ODv1Hr3lhLwAObeukNSqyhQubKzDw6MDhbd4+KDvwI4m8UxP8SGxXKXlC/F8zO8Bx74f/LvXzewNQyJlFwRoU/u94bd2NWwEbjJohZFRwPGM/RjY7DUm8a4zF5gRdy5Vt7e0FQ2/hWsoJdqeG9agxIJEm5QZoZqaIBSsTq19RcSI0SY/L6FnSx4sKOrVjsFdiBRAgK8+C2j4oK54="],
            x5t:"eGs0S2paTkZ5TFVxVU9XUm1LMXBFd1JPVDZZPQ"
        }
    ]
};

export interface JWKS {
  keys: [
    {
      alg: string
      kty: string
      use: string
      x5c: [string]
      n: string
      e: string
      kid: string
      x5t: string
    }
  ]
}

export const createCertificate = ({
  publicKey,
  privateKey,
  jwksOrigin,
}: {
  publicKey: forge.pki.PublicKey
  privateKey: forge.pki.PrivateKey
  jwksOrigin?: string
}) => {
  const cert = forge.pki.createCertificate()
  cert.publicKey = publicKey
  cert.serialNumber = '123'
  const attrs = [
    {
      name: 'commonName',
      value: `${jwksOrigin}`,
    },
  ]
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)
  cert.setSubject(attrs)
  cert.sign(privateKey)
  return forge.pki.certificateToPem(cert)
}

const getCertThumbprint = (certificate: string) => {
  const shasum = createHash('sha1')
  const der = Buffer.from(certificate).toString('binary')
  shasum.update(der)
  return shasum.digest('base64')
}

export const createJWKS = ({
  privateKey,
  publicKey,
  jwksOrigin,
}: {
  privateKey: forge.pki.PrivateKey
  publicKey: forge.pki.PublicKey
  jwksOrigin?: string
}): JWKS => {
  return JWKS_CONST;
}

export const createKeyPair = () => {
  const privateKey = forge.pki.privateKeyFromPem(PRIVATE_KEY_PEM)
  const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM)
  return {
    privateKey,
    publicKey,
  }
}

export interface JwtPayload {
  sub?: string
  iss?: string
  aud?: string
  exp?: string
  nbf?: string
  iat?: string
  jti?: string
}

export const signJwt = (
  privateKey: forge.pki.PrivateKey,
  jwtPayload: JwtPayload,
  kid?: string
) => {
  const bufferedJwt = Buffer.from(JSON.stringify(jwtPayload))
  return sign(bufferedJwt, forge.pki.privateKeyToPem(privateKey), {
    algorithm: 'RS256',
    header: { kid },
  })
}
