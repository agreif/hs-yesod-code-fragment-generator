module Main where

import Prelude hiding (putStr, getContents)

import Data.Aeson (Value)
import Data.Aeson.Encode.Pretty (encodePretty)
import Data.ByteString (getContents)
import Data.ByteString.Lazy (putStr)
import System.Environment (getArgs)
import System.Exit

import Data.Yaml (decodeFileEither, decodeEither')

helpMessage :: IO ()
helpMessage = putStrLn "yaml2json FILE\n  use - as FILE to indicate stdin" >> exitFailure

showJSON :: Show a => Either a Value -> IO b
showJSON ejson =
    case ejson of
       Left err -> print err >> exitFailure
       Right res -> putStr (encodePretty (res :: Value)) >> exitSuccess

main :: IO ()
main = do
    args <- getArgs
    case args of
       -- strict getContents will read in all of stdin at once
       (["-"]) -> getContents >>= showJSON . decodeEither'
       ([f])   -> decodeFileEither f >>= showJSON
       _ -> helpMessage
